#![allow(dead_code)]

extern crate structopt;
#[macro_use]
extern crate structopt_derive;

use std::collections::HashMap;
use std::num::{ParseFloatError, ParseIntError};
use std::path::Path;
use std::fs::File;
use std::io::{BufRead, BufReader, BufWriter, Write};
use std::io::stdout;
use std::io;
use structopt::StructOpt;


#[derive(Debug)]
enum Error
{
    Conversion(ConversionError),
    Parse(ParseError),
}

#[derive(StructOpt, Debug)]
#[structopt(name = "obj_to_arr", about = "Converts WaveFront .obj files to a JavaScript array.")]
struct Args
{
    #[structopt(name = "file", help = "The source .obj file.")] obj_file: String,
}

fn main()
{
    if let Err(why) = run()
    {
        eprintln!("An error occurred: {:#?}", why);
        ::std::process::exit(1);
    }
}

fn run() -> Result<(), Error>
{
    let args = Args::from_args();
    let parsed = parse_obj(Path::new(&args.obj_file)).map_err(|err| Error::Parse(err))?;
    print_js_array(parsed).map_err(|err| Error::Conversion(err))?;

    Ok(())
}

fn print_js_array(vertices: HashMap<String, Vec<Vertex>>) -> Result<(), ConversionError>
{
    let stdout = stdout();
    let mut writer = BufWriter::new(stdout);

    writeln!(&mut writer, "const mesh = [")?;

    for (name, data) in vertices
    {
        writeln!(&mut writer, "// Object: '{}'", name)?;

        for vertex_str in data.iter().map(|v| {
            v.as_raw()
                .fold(String::new(), |string, val| format!("{}{}, ", string, val))
        })
        {
            writeln!(&mut writer, "{}", vertex_str)?;
        }
    }

    writeln!(&mut writer, "];")?;

    Ok(())
}

fn parse_obj(file: &Path) -> Result<HashMap<String, Vec<Vertex>>, ParseError>
{
    let cwd = file.parent().ok_or(ParseError::CouldNotCalcFileDir)?;
    let reader = BufReader::new(File::open(file)?);

    let mut result: HashMap<String, Vec<Vertex>> = HashMap::new();
    let mut buffer = Vec::with_capacity(10_000);
    let mut current_obj = String::new();
    let mut materials = HashMap::with_capacity(100);
    let mut current_mtl = None;
    let mut vertex_pos = Vec::with_capacity(10_000);
    let mut normals = Vec::with_capacity(10_000);

    for line in reader.lines()
    {
        let line = line?;
        let mut tokens = line.split_whitespace();

        if let Some(key) = tokens.next()
        {
            match key
            {
                "o" =>
                {
                    if buffer.len() > 0
                    {
                        result.insert(current_obj, buffer.drain(..).collect());
                    }
                    current_obj = parse_oname(tokens)?
                }
                "v" => vertex_pos.push(parse_vertex(tokens)?),
                "vn" => normals.push(parse_normal(tokens)?),
                "mtllib" => parse_mtllib(&mut materials, cwd, tokens)?,
                "usemtl" =>
                {
                    let name = parse_mtl_name(tokens)?;
                    current_mtl = Some(
                        materials
                            .get(&name)
                            .ok_or(ParseError::UndefinedMtlName(name))?
                            .clone(),
                    )
                }
                "f" =>
                {
                    let mtl = current_mtl.as_ref().ok_or(ParseError::NoActiveMtl)?;
                    parse_faces(&vertex_pos, &normals, mtl, tokens, &mut buffer)?;
                }
                _ => (),
            }
        }
    }

    // make sure to flush buffer
    if buffer.len() > 0
    {
        result.insert(current_obj, buffer.drain(..).collect());
    }

    Ok(result)
}

fn parse_faces<'a, I>(
    vertices: &[Vec<f32>],
    normals: &[Vec<f32>],
    mtl: &Material,
    iter: I,
    buffer: &mut Vec<Vertex>,
) -> Result<(), ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let faces: Vec<_> = iter.take(3).collect();

    if faces.len() < 3
    {
        Err(ParseError::MissingFaces)
    }
    else
    {
        let indices = faces
            .iter()
            .map(|f| f.split("/").collect::<Vec<_>>())
            .map(|f| {
                if f.len() >= 2
                {
                    Ok(f)
                }
                else
                {
                    Err(ParseError::MissingFaceIndex)
                }
            })
            .map(|f| f.map(|vec| (vec[0], vec[vec.len() - 1])))
            .map(|idx| {
                idx.map(|(i, j)| {
                    (
                        i.parse::<i32>().map(|i| calc_index(i, vertices.len())),
                        j.parse::<i32>().map(|j| calc_index(j, normals.len())),
                    )
                })
            })
            .collect::<Result<Vec<_>, ParseError>>()?;

        for vert in indices
        {
            let (v, n) = vert;
            let v = v.map_err(|err| ParseError::CouldNotParseIndex(err))?;
            let n = n.map_err(|err| ParseError::CouldNotParseIndex(err))?;

            buffer.push(Vertex::new(
                vertices[v].clone(),
                normals[n].clone(),
                mtl.clone(),
            ));
        }

        Ok(())
    }
}

fn calc_index(idx: i32, buf_len: usize) -> usize
{
    // zero is invalid index, correct it
    let idx = if idx == 0
    {
        eprintln!("[WARN] Face index was '0', corrected to '1'.");
        1
    }
    else
    {
        idx
    };


    if idx > 0
    {
        (idx - 1) as usize
    }
    else
    {
        // -1 is the last index, -2 second to last, ..
        buf_len - (idx as usize)
    }
}

fn parse_oname<'a, I>(mut iter: I) -> Result<String, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    iter.next()
        .ok_or(ParseError::MissingObjName)
        .map(|s| s.to_string())
}

fn parse_mtl_name<'a, I>(mut iter: I) -> Result<String, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    iter.next()
        .ok_or(ParseError::MissingMtlName)
        .map(|s| s.to_string())
}

fn parse_vertex<'a, I>(iter: I) -> Result<Vec<f32>, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let mut vec = parse_float_vec(iter)?;

    match vec.len()
    {
        4 => Ok(vec),
        3 =>
        {
            vec.push(1.0);
            Ok(vec)
        }
        len => Err(ParseError::WrongNumComponents(len)),
    }
}

fn parse_normal<'a, I>(iter: I) -> Result<Vec<f32>, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let vec = parse_float_vec(iter)?;

    match vec.len()
    {
        3 => Ok(vec),
        len => Err(ParseError::WrongNumComponents(len)),
    }
}

fn parse_mtllib<'a, I>(mtls: &mut HashMap<String, Material>, dir: &Path, mut iter: I) -> Result<(), ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let lib = iter.next().ok_or(ParseError::MissingMtllibName)?;
    let lib = dir.with_file_name(lib);

    let reader = BufReader::new(File::open(lib)?);

    let mut mtl_name = None;
    let mut mtl = MaterialBuilder::new();

    for line in reader.lines()
    {
        let line = line?;
        let mut tokens = line.split_whitespace();

        if let Some(key) = tokens.next()
        {
            match key
            {
                "newmtl" =>
                {
                    if let Some(name) = mtl_name
                    {
                        mtls.insert(name, mtl.build().ok_or(ParseError::MissingMtlField)?);
                        mtl = MaterialBuilder::new();
                    }

                    mtl_name = Some(parse_mtl_name(tokens)?);
                }
                "d" => mtl = mtl.alpha(parse_scalar(tokens)?),
                "Tr" => mtl = mtl.alpha(1.0 - parse_scalar(tokens)?),
                "Ns" => mtl = mtl.hardness(parse_scalar(tokens)?),
                "Ka" => mtl = mtl.ambient_col(parse_color(tokens)?),
                "Kd" => mtl = mtl.diffuse_col(parse_color(tokens)?),
                "Ks" => mtl = mtl.specular_col(parse_color(tokens)?),
                _ => (),
            }
        }
    }

    // try to parse last mtl
    if let Some(name) = mtl_name
    {
        if let Some(mtl) = mtl.build()
        {
            mtls.insert(name, mtl);
        }
    }

    Ok(())
}

fn parse_scalar<'a, I>(iter: I) -> Result<f32, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let vec = parse_float_vec(iter)?;

    match vec.len()
    {
        1 => Ok(vec[0]),
        len => Err(ParseError::WrongNumComponents(len)),
    }
}

fn parse_color<'a, I>(iter: I) -> Result<Vec<f32>, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    let vec = parse_float_vec(iter)?;

    match vec.len()
    {
        3 => Ok(vec),
        len => Err(ParseError::WrongNumComponents(len)),
    }
}

fn parse_float_vec<'a, I>(iter: I) -> Result<Vec<f32>, ParseError>
where
    I: Iterator<Item = &'a str>,
{
    iter.map(|s| {
        s.parse::<f32>()
            .map_err(|e| ParseError::CouldNotParseFloat(e))
    }).collect()
}

struct Vertex
{
    pos: Vec<f32>,
    normal: Vec<f32>,
    // should be ref instead of owned
    mtl: Material,
}

impl Vertex
{
    pub fn new(pos: Vec<f32>, normal: Vec<f32>, mtl: Material) -> Vertex
    {
        Vertex {
            pos: pos,
            normal: normal,
            mtl: mtl,
        }
    }

    pub fn as_raw(&self) -> VertexIter
    {
        self.pos
            .iter()
            .chain(self.normal.iter())
            .chain(vec![&self.mtl.hardness, &self.mtl.transparency])
            .chain(self.mtl.ambient_col.iter())
            .chain(self.mtl.diffuse_col.iter())
            .chain(self.mtl.specular_col.iter())
    }
}

type VertexIter<'a> = std::iter::Chain<
    std::iter::Chain<
        std::iter::Chain<
            std::iter::Chain<
                std::iter::Chain<std::slice::Iter<'a, f32>, std::slice::Iter<'a, f32>>,
                std::vec::IntoIter<&'a f32>,
            >,
            std::slice::Iter<'a, f32>,
        >,
        std::slice::Iter<'a, f32>,
    >,
    std::slice::Iter<'a, f32>,
>;

#[derive(Clone)]
struct Material
{
    hardness: f32,
    transparency: f32,
    ambient_col: Vec<f32>,
    diffuse_col: Vec<f32>,
    specular_col: Vec<f32>,
}

struct MaterialBuilder
{
    hardness: Option<f32>,
    alpha: Option<f32>,
    ambient_col: Option<Vec<f32>>,
    diffuse_col: Option<Vec<f32>>,
    specular_col: Option<Vec<f32>>,
}

impl MaterialBuilder
{
    pub fn new() -> MaterialBuilder
    {
        MaterialBuilder {
            hardness: None,
            alpha: None,
            ambient_col: None,
            diffuse_col: None,
            specular_col: None,
        }
    }

    pub fn build(self) -> Option<Material>
    {
        Some(Material {
            hardness: self.hardness?,
            transparency: self.alpha?,
            ambient_col: self.ambient_col?,
            diffuse_col: self.diffuse_col?,
            specular_col: self.specular_col?,
        })
    }

    pub fn hardness(mut self, val: f32) -> Self
    {
        self.hardness = Some(val);
        self
    }

    pub fn alpha(mut self, val: f32) -> Self
    {
        self.alpha = Some(val);
        self
    }

    pub fn ambient_col(mut self, val: Vec<f32>) -> Self
    {
        self.ambient_col = Some(val);
        self
    }

    pub fn diffuse_col(mut self, val: Vec<f32>) -> Self
    {
        self.diffuse_col = Some(val);
        self
    }

    pub fn specular_col(mut self, val: Vec<f32>) -> Self
    {
        self.specular_col = Some(val);
        self
    }
}

#[derive(Debug)]
enum ParseError
{
    MissingObjName,
    CouldNotCalcFileDir,
    CouldNotParseFloat(ParseFloatError),
    CouldNotParseIndex(ParseIntError),
    WrongNumComponents(usize),
    MissingFaces,
    MissingFaceIndex,
    UndefinedMtlName(String),
    NoActiveMtl,
    MissingMtllibName,
    MissingMtlName,
    MissingMtlField,
    Io(io::Error),
}

impl From<io::Error> for ParseError
{
    fn from(from: io::Error) -> ParseError
    {
        ParseError::Io(from)
    }
}

#[derive(Debug)]
enum ConversionError
{
    Io(io::Error),
}

impl From<io::Error> for ConversionError
{
    fn from(from: io::Error) -> ConversionError
    {
        ConversionError::Io(from)
    }
}
