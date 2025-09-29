interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // Otras variables de entorno si las tienes
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}