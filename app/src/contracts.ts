export type User = { id:string; name:string; role:string; teamId?:string };
export type Citation = { id:string; title:string; type:string; path?:string; excerpt?:string; content?:string; assetId?:string; [key:string]:any };
export type VisualizationMeta = {
  valueLabel?:string;
  categoryLabel?:string;
  unit?:string;
  currency?:string;
  format?:"currency"|"number";
  [key:string]:unknown;
};
export type Visualization = { type:string; title?:string; columns?:string[]; rows?:any[][]; data?:any[]; meta?:VisualizationMeta; [key:string]:any };
export type TraceStep = { tool?:string; detail?:string; durationMs?:number; [key:string]:any };
export type ModelInfo = { name?:string; status?:string; reason?:string; [key:string]:any };
export type CopilotAnswer = {
  answer:string;
  visualization?:Visualization;
  citations?:Citation[];
  conflicts?:string[];
  referencedWellIds?:string[];
  memory?:string[];
  trace?:TraceStep[];
  model?:ModelInfo;
  durationMs?:number;
  [key:string]:any;
};
export type ChatMessage = {
  id:string;
  role:"user"|"assistant";
  text:string;
  response?:CopilotAnswer;
  createdAt?:string;
};
export type Bootstrap = {
  users:User[];
  areas?:any[];
  stats?:{wells?:number;inspections?:number;repairs?:number;sources?:number;today?:string};
  sources?:Record<string,number>;
  memory?:Record<string,any>;
  loadedRoots?:string[];
  [key:string]:any;
};
