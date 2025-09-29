import React from 'react';
import { HTML5Icon, CSS3Icon, JavaScriptIcon, TypeScriptIcon, ReactIcon, VueJSIcon, NextJSIcon, NodeJSIcon, TailwindIcon, SupabaseIcon, OpenAIIcon, VercelIcon, GeminiIcon, GitHubIcon } from '../components/ui/icons';

export const NAV_LINKS = [
  { id: 'home', title: 'Inicio', path: '/#home' },
  { id: 'about', title: 'Sobre Mí', path: '/#about' },
  { id: 'services', title: 'Servicios', path: '/#services' },
  { id: 'work', title: 'Mi Trabajo', path: '/#work' },
  { id: 'contact', title: 'Contacto', path: '/#contact' },
];

export const STATS = [
    { value: 15, suffix: '+', label: 'Años de Experiencia' },
    { value: 75, suffix: '+', label: 'Clientes Satisfechos' },
    { value: 250, suffix: '+', label: 'Proyectos Exitosos' },
];

// FIX: Replaced JSX syntax with React.createElement calls to be compatible with a .ts file.
// This resolves errors where the TypeScript compiler misinterprets JSX as type syntax.
export const LOGOS = [
  { name: 'HTML5', icon: React.createElement(HTML5Icon, { className: "h-12 w-12" }) },
  { name: 'CSS3', icon: React.createElement(CSS3Icon, { className: "h-12 w-12" }) },
  { name: 'JavaScript', icon: React.createElement(JavaScriptIcon, { className: "h-12 w-12" }) },
  { name: 'TypeScript', icon: React.createElement(TypeScriptIcon, { className: "h-12 w-12" }) },
  { name: 'React', icon: React.createElement(ReactIcon, { className: "h-12 w-12" }) },
  { name: 'Next.js', icon: React.createElement(NextJSIcon, { className: "h-12 w-12" }) },
  { name: 'Node.js', icon: React.createElement(NodeJSIcon, { className: "h-12 w-12" }) },
  { name: 'Tailwind CSS', icon: React.createElement(TailwindIcon, { className: "h-12 w-12" }) },
  { name: 'Supabase', icon: React.createElement(SupabaseIcon, { className: "h-12 w-12" }) },
  { name: 'Vercel', icon: React.createElement(VercelIcon, { className: "h-10 w-10" }) },
  { name: 'Gemini', icon: React.createElement(GeminiIcon, { className: "h-12 w-12" }) },
  { name: 'GitHub', icon: React.createElement(GitHubIcon, { className: "h-12 w-12" }) },
  { name: 'Vue.js', icon: React.createElement(VueJSIcon, { className: "h-12 w-12" }) },
  { name: 'OpenAI', icon: React.createElement(OpenAIIcon, { className: "h-12 w-12" }) },
];

export const TESTIMONIALS = [
    {
        quote: "Esta plantilla es muy hermosa y tiene opciones nuevas y maravillosas. El soporte es uno de los mejores con los que he tenido el placer de interactuar. ¡Rápido, cortés y extremadamente útil!",
        author: 'Andrés Pérez',
        title: 'Dueño de Negocio',
        image: 'https://picsum.photos/seed/adam/100/100',
    },
    {
        quote: "Un tema hermoso y flexible. Mucho más robusto de lo que necesitaba para este proyecto, pero tan elegante que no pude resistirme. El soporte también fue muy receptivo. ¡Definitivamente consideraré más temas de este desarrollador!",
        author: 'Sergio García',
        title: 'Director de Empresa',
        image: 'https://picsum.photos/seed/sergio/100/100',
    },
    {
        quote: "¡Diseño fantástico, increíblemente bien documentado y un absoluto placer de usar! Uno de los temas más atractivos que existen.",
        author: 'Andrea López',
        title: 'Agencia X',
        image: 'https://picsum.photos/seed/andrea/100/100',
    },
];

