import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "docs/research/cuestionario-betatesters/**",
    ],
  },
  {
    rules: {
      // React Compiler rule, muy estricta con patrones comunes (cerrar menú al navegar,
      // leer localStorage en efecto). Downgraded a warn; migrar componentes en fase de limpieza.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
