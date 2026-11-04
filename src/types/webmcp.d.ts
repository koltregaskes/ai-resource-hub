// Types for the WebMCP declarative form attributes (Chrome origin trial), so `astro check`
// accepts them in .astro templates. Names from
// https://developer.chrome.com/docs/ai/webmcp/declarative-api
declare namespace astroHTML.JSX {
  interface FormHTMLAttributes {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: boolean | string;
  }
  interface InputHTMLAttributes {
    toolparamdescription?: string;
  }
  interface SelectHTMLAttributes {
    toolparamdescription?: string;
  }
  interface TextareaHTMLAttributes {
    toolparamdescription?: string;
  }
}
