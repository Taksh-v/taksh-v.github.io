'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const casePath = path.join(root, 'projects/body-aware-shopping-compatibility.html');
const casePage = fs.readFileSync(casePath, 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
let checks = 0;
function has(source, pattern, message) { assert.match(source, pattern, message); checks++; }
function exists(file, message) { assert.ok(fs.existsSync(file), message); checks++; }

has(home, /<title>Taksh Vadaliya — AI Application Engineer<\/title>/, 'specific page title');
has(home, /name="description" content="Taksh Vadaliya is an AI application engineer/, 'search description');
has(home, /<main id="main">[\s\S]*?<section class="hero"/, 'semantic main and hero');
has(home, /I make <span>AI useful\.<\/span>/, 'plain-language headline');
has(home, /Open to AI application engineering roles/, 'availability statement');
has(home, /href="#work"/, 'work navigation');
has(home, /href="#about"/, 'about navigation');
has(home, /href="#contact"/, 'contact navigation');
for (const id of ['work', 'approach', 'about', 'skills', 'contact']) has(home, new RegExp('id="' + id + '"'), 'section exists: ' + id);
for (const project of ['yap — voice conversations', 'Assest — company knowledge system', 'Qual — evaluation-first RAG', 'Body-aware shopping compatibility', 'DDAS — duplicate detection in C']) has(home, new RegExp(project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'project represented: ' + project);
has(home, /Live product/, 'live project is labeled');
has(home, /Research prototype/, 'prototype is labeled');
has(home, /measurements are estimates|centimetre values are estimates|centimeter values are estimates/i, 'prototype measurement caveat');
has(home, /prefers-reduced-motion/, 'reduced-motion support');
has(home, /aria-expanded="false"/, 'mobile menu has accessible state');
has(home, /@type":"Person"/, 'Person structured metadata');
exists(casePath, 'project case study exists');
exists(path.join(root, 'assets/body-profile-masks.png'), 'mask-only reference image exists');
has(casePage, /Open the shared notebook/, 'project page links to Colab');
has(casePage, /not a live recommendation product/i, 'project page states current status');
has(casePage, /scaled using entered height/, 'project page explains scale limitation');
has(casePage, /No compatibility engine/, 'project page says recommendations are not built');
has(sitemap, /https:\/\/taksh-v\.github\.io\/projects\/body-aware-shopping-compatibility\.html/, 'case study is in sitemap');
has(notFound, /This page went off route/, 'branded 404 page');
console.log('Portfolio smoke checks passed: ' + checks);
