const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const HEADER_MARKER = "<!-- HEADER_INCLUDE -->";
const FOOTER_MARKER = "<!-- FOOTER_INCLUDE -->";
const CSS_LINK = '<link rel="stylesheet" href="/assets/site-chrome.css">';

const headerTemplate = fs.readFileSync(path.join(ROOT, "_includes", "header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "_includes", "footer.html"), "utf8");

const excludedTopLevel = new Set(["_includes", "scripts", "dist", ".git", "node_modules"]);
const excludedFiles = new Set(["package.json", "package-lock.json", ".gitignore", "README.md"]);

function removeDirectory(target){
  if(fs.existsSync(target)) fs.rmSync(target,{recursive:true,force:true});
}

function copySource(current, destination, depth=0){
  fs.mkdirSync(destination,{recursive:true});
  for(const entry of fs.readdirSync(current,{withFileTypes:true})){
    if(depth===0 && excludedTopLevel.has(entry.name)) continue;
    if(depth===0 && excludedFiles.has(entry.name)) continue;
    const sourcePath = path.join(current,entry.name);
    const destinationPath = path.join(destination,entry.name);
    if(entry.isDirectory()) copySource(sourcePath,destinationPath,depth+1);
    else fs.copyFileSync(sourcePath,destinationPath);
  }
}

function walkHtml(directory, files=[]){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const fullPath = path.join(directory,entry.name);
    if(entry.isDirectory()) walkHtml(fullPath,files);
    else if(entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function routeFor(file){
  const relative = path.relative(DIST,file).split(path.sep).join("/");
  if(relative === "index.html") return "/";
  return `/${relative.replace(/index\.html$/i,"")}`;
}

function activeAttributes(route){
  const isHome = route === "/";
  const isBlog = route === "/blog/" || route.startsWith("/blog/");
  const isQuizLibrary = route === "/quiz/";
  const isQuizPage = /-quiz\/$/.test(route) || route === "/home-fragrance-quiz/";
  return {
    HOME_CURRENT:isHome?' aria-current="page"':"",
    QUIZ_CURRENT:(isQuizLibrary||isQuizPage)?' aria-current="page"':"",
    BLOG_CURRENT:isBlog?' aria-current="page"':""
  };
}

function renderHeader(route){
  const attributes = activeAttributes(route);
  return headerTemplate
    .replaceAll("{{HOME_CURRENT}}",attributes.HOME_CURRENT)
    .replaceAll("{{QUIZ_CURRENT}}",attributes.QUIZ_CURRENT)
    .replaceAll("{{BLOG_CURRENT}}",attributes.BLOG_CURRENT);
}

function buildPage(file){
  const route = routeFor(file);
  let html = fs.readFileSync(file,"utf8");
  if(!html.includes(HEADER_MARKER)) throw new Error(`Missing header marker: ${route}`);
  if(!html.includes(FOOTER_MARKER)) throw new Error(`Missing footer marker: ${route}`);
  html = html.replace(HEADER_MARKER,renderHeader(route));
  html = html.replace(FOOTER_MARKER,footerTemplate);
  if(!html.includes('/assets/site-chrome.css')){
    html = html.replace(/<\/head>/i,`${CSS_LINK}\n</head>`);
  }
  fs.writeFileSync(file,html,"utf8");
}

removeDirectory(DIST);
copySource(ROOT,DIST);
const pages = walkHtml(DIST);
pages.forEach(buildPage);
console.log(`Built ${pages.length} HTML pages into ${path.relative(ROOT,DIST)}.`);
