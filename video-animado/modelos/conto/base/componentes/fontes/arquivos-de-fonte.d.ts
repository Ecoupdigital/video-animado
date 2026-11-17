// O bundler do Remotion importa arquivo de fonte como endereço (texto); isto diz isso ao TypeScript.
declare module '*.woff2' {
  const endereco: string;
  export default endereco;
}
declare module '*.ttf' {
  const endereco: string;
  export default endereco;
}
