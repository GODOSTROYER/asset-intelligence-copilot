import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export type RecordLike = Record<string, any>;
export type EvidenceDoc = {
  id: string;
  title: string;
  type: string;
  assetId?: string;
  path: string;
  content: string;
  origin?: string;
};
export type WellData = {
  metadata: RecordLike;
  inspections: RecordLike[];
  maintenance: RecordLike[];
  regulatoryEvents: RecordLike[];
  context: RecordLike[];
};
export type Dataset = {
  roots: string[];
  wells: WellData[];
  areas: RecordLike[];
  users: RecordLike[];
  documents: EvidenceDoc[];
  manuals: Record<string, EvidenceDoc>;
  today: string;
  warnings?: string[];
};

const existsDir = async (candidate: string) => {
  try { return (await stat(candidate)).isDirectory(); } catch { return false; }
};
async function jsonFile<T>(file: string): Promise<T> {
  try { return JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, "")) as T; }
  catch (error: any) { if (error?.code) throw error; throw new Error('Invalid JSON in '+file+'.'); }
}
function object(value: unknown): value is RecordLike {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function identity(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value === value.trim();
}
function validTimestamp(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const date=value.slice(0,10);
  return new Date(date).toISOString().slice(0,10) === date;
}
function fleetRecords(value: unknown, key: string, idKey: string, file: string): RecordLike[] {
  if (!object(value) || !Array.isArray(value[key])) throw new Error('Expected '+key+' array in '+file+'.');
  const seen=new Set<string>();
  for (const row of value[key]) {
    if (!object(row) || !identity(row[idKey])) throw new Error('Missing or invalid '+idKey+' in '+file+'.');
    // User IDs become keys in the JSON-backed private-history dictionary.
    // Inherited Object names cannot represent a safe independent identity there.
    if (idKey==='user_id' && Object.hasOwn(Object.prototype,row[idKey])) throw new Error('Reserved user_id '+row[idKey]+' in '+file+'.');
    if (seen.has(row[idKey])) throw new Error('Duplicate '+idKey+' '+row[idKey]+' in '+file+'.');
    seen.add(row[idKey]);
  }
  return value[key];
}
async function jsonl(file: string, assetId: string, idKey: string, dateKey?: string): Promise<RecordLike[]> {
  try {
    const raw = (await readFile(file, "utf8")).replace(/^\uFEFF/, ""),rows:RecordLike[]=[],seen=new Set<string>();
    for (const [index,line] of raw.split(/\r?\n/).entries()) {
      if (!line.trim()) continue;
      let row:unknown;
      try { row=JSON.parse(line); } catch { throw new Error('Invalid JSON in '+file+' at line '+(index+1)+'.'); }
      if (!object(row) || !identity(row[idKey])) throw new Error('Missing or invalid '+idKey+' in '+file+' at line '+(index+1)+'.');
      if (row.asset_id !== assetId) throw new Error('Record '+row[idKey]+' in '+file+' belongs to a different or missing asset_id.');
      if (seen.has(row[idKey])) throw new Error('Duplicate '+idKey+' '+row[idKey]+' in '+file+'.');
      if (dateKey && !validTimestamp(row[dateKey])) throw new Error('Missing or invalid '+dateKey+' for '+row[idKey]+' in '+file+'.');
      seen.add(row[idKey]);rows.push(row);
    }
    return rows;
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}
function cleanPath(value: string) {
  return value.split(path.sep).join("/");
}
async function normalizeRoot(input: string) {
  const absolute = path.resolve(input);
  if (await existsDir(path.join(absolute, "assets")) && await existsDir(path.join(absolute, "fleet"))) return absolute;
  for (const name of ["sample-data", "test-data"]) {
    const nested = path.join(absolute, name);
    if (await existsDir(path.join(nested, "assets")) && await existsDir(path.join(nested, "fleet"))) return nested;
  }
  throw new Error("Dataset folder must contain fleet/ and assets/, or a sample-data/ folder with both.");
}
function pushRecordDoc(docs: EvidenceDoc[], root: string, assetId: string, id: string, title: string, type: string, file: string, content: string) {
  docs.push({ id, title, type, assetId, path: cleanPath(path.join(path.basename(root), path.relative(root, file))), origin:root, content });
}
async function readOneRoot(rootInput: string): Promise<Dataset> {
  const root = await normalizeRoot(rootInput);
  const fleet = path.join(root, "fleet");
  const assetsDir = path.join(root, "assets");
  const areaJson = await jsonFile<{ areas: RecordLike[] }>(path.join(fleet, "areas.json"));
  const userJson = await jsonFile<{ users: RecordLike[] }>(path.join(fleet, "users.json"));
  const areas=fleetRecords(areaJson,'areas','area_id',path.join(fleet,'areas.json'));
  const users=fleetRecords(userJson,'users','user_id',path.join(fleet,'users.json'));
  const docs: EvidenceDoc[] = [];
  const manuals: Record<string, EvidenceDoc> = {};
  const warnings: string[] = [];
  const typeDir = path.join(fleet, "well-types");
  for (const file of await readdir(typeDir).catch(() => [])) {
    if (!file.toLowerCase().endsWith(".md")) continue;
    const full = path.join(typeDir, file);
    const content = await readFile(full, "utf8");
    const wellType = path.basename(file, path.extname(file));
    const doc = { id: "OM-" + wellType, title: wellType + " operating manual", type: "manual", path: cleanPath(path.join(path.basename(root),path.relative(root, full))), origin:root, content };
    manuals[wellType] = doc;
    docs.push(doc);
  }
  const sopsDir = path.join(fleet, "sops");
  for (const file of await readdir(sopsDir).catch(() => [])) {
    if (!file.toLowerCase().endsWith(".md")) continue;
    const full = path.join(sopsDir, file);
    const content = await readFile(full, "utf8");
    const doc = { id: path.basename(file, path.extname(file)).toUpperCase(), title: path.basename(file, path.extname(file)).replaceAll("-", " "), type: "SOP", path: cleanPath(path.join(path.basename(root),path.relative(root, full))), origin:root, content };
    docs.push(doc);
  }

  const wells: WellData[] = [];
  for (const entry of await readdir(assetsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(assetsDir, entry.name);
    const metaFile = path.join(dir, "metadata.json");
    try {
      const metadata = await jsonFile<RecordLike>(metaFile);
      const assetId = object(metadata) ? metadata.asset_id : undefined;
      if (typeof assetId !== 'string' || !/^WELL-\d+$/i.test(assetId)) throw new Error('Invalid well metadata in '+entry.name);
      if (wells.some(w=>w.metadata.asset_id===assetId)) throw new Error('Duplicate asset_id '+assetId+' in '+root+'.');
      const inspectionFile = path.join(dir, "inspections.jsonl");
      const maintenanceFile = path.join(dir, "maintenance.jsonl");
      const regulatorFile = path.join(dir, "regulatory-events.jsonl");
      const contextFile = path.join(dir, "context.jsonl");
      const inspections = await jsonl(inspectionFile,assetId,'inspection_id','inspected_at');
      const maintenance = await jsonl(maintenanceFile,assetId,'maintenance_id','started_at');
      const regulatoryEvents = await jsonl(regulatorFile,assetId,'event_id','date');
      const context = await jsonl(contextFile,assetId,'note_id','created_at');
      wells.push({ metadata, inspections, maintenance, regulatoryEvents, context });

      for (const row of inspections) pushRecordDoc(docs, root, assetId, row.inspection_id, "Inspection · " + row.inspection_id, "inspection", inspectionFile, JSON.stringify(row));
      for (const row of maintenance) {
        pushRecordDoc(docs, root, assetId, row.maintenance_id, "Repair · " + row.maintenance_id, "repair", maintenanceFile, JSON.stringify(row));
        if (row.report_file) {
          const reportPath = path.resolve(dir, row.report_file);
          const relativeReport = path.relative(dir, reportPath);
          if (relativeReport!=='..' && !relativeReport.startsWith('..'+path.sep) && !path.isAbsolute(relativeReport) && await existsDir(path.dirname(reportPath))) {
            try {
              const content = await readFile(reportPath, "utf8");
              docs.push({ id: row.maintenance_id, title: "Repair report · " + row.maintenance_id, type: "repair report", assetId, path: cleanPath(path.join(path.basename(root),path.relative(root, reportPath))), origin:root, content });
            } catch { warnings.push('Missing report for '+row.maintenance_id); }
          } else {
            warnings.push('Report path unavailable or outside well folder for '+row.maintenance_id);
          }
        }
      }
      for (const row of regulatoryEvents) pushRecordDoc(docs, root, assetId, row.event_id, "Regulator event · " + row.event_id, "regulator", regulatorFile, JSON.stringify(row));
      for (const row of context) pushRecordDoc(docs, root, assetId, row.note_id, "Operator note · " + row.note_id, "note", contextFile, JSON.stringify(row));
      docs.push({ id: assetId, title: "Well details · " + assetId, type: "well", assetId, path: cleanPath(path.join(path.basename(root),path.relative(root, metaFile))), origin:root, content: JSON.stringify(metadata) });
    } catch (error: any) {
      if (error?.code !== "ENOENT") throw error;
      warnings.push('Skipped folder without metadata: '+entry.name);
    }
  }
  if (!wells.length) throw new Error('Dataset contains no valid wells.');
  if (!users.length) throw new Error('Dataset contains no users.');
  validateRecordOwnership(wells);
  return { roots: [root], wells, areas, users, documents: docs, manuals, today: "", warnings };
}
function validateRecordOwnership(wells: WellData[]) {
  const owners=new Map<string,string>();
  for(const well of wells)for(const [rows,key] of [[well.inspections,'inspection_id'],[well.maintenance,'maintenance_id'],[well.regulatoryEvents,'event_id'],[well.context,'note_id']] as const)for(const row of rows){
    const id=key+':'+row[key],owner=owners.get(id);
    if(owner&&owner!==well.metadata.asset_id)throw new Error('Record identity '+row[key]+' is assigned to both '+owner+' and '+well.metadata.asset_id+'.');
    owners.set(id,well.metadata.asset_id);
  }
}
function mergeById<T extends RecordLike>(first: T[], second: T[], idKey: string) {
  const merged = new Map<string, T>();
  for (const item of first) merged.set(String(item[idKey]), item);
  // Imported rows are authoritative records, not field patches. Keeping omitted
  // old fields would calculate values absent from the replacement's citation.
  for (const item of second) merged.set(String(item[idKey]), item);
  return Array.from(merged.values());
}
function mergeDatasets(a: Dataset, b: Dataset): Dataset {
  const wellMap = new Map(a.wells.map((w) => [w.metadata.asset_id, w]));
  for (const next of b.wells) {
    const id = next.metadata.asset_id;
    const current = wellMap.get(id);
    if (!current) {
      wellMap.set(id, next);
      continue;
    }
    wellMap.set(id, {
      metadata: next.metadata,
      inspections: mergeById(current.inspections, next.inspections, "inspection_id"),
      maintenance: mergeById(current.maintenance, next.maintenance, "maintenance_id"),
      regulatoryEvents: mergeById(current.regulatoryEvents, next.regulatoryEvents, "event_id"),
      context: mergeById(current.context, next.context, "note_id")
    });
  }
  // A repair record and its narrative report deliberately share an ID.
  const documentMap = new Map(a.documents.map(d => [d.type+':'+d.id,d]));
  // A replacement repair invalidates its previous narrative even when its new
  // report pointer is null or the replacement file cannot be read.
  for(const well of b.wells)for(const repair of well.maintenance)documentMap.delete('repair report:'+repair.maintenance_id);
  for(const doc of b.documents)documentMap.set(doc.type+':'+doc.id,doc);
  const documents = [...documentMap.values()];
  const manuals = { ...a.manuals, ...b.manuals };
  const latest = [...wellMap.values()].flatMap((w) => w.inspections.map((i) => i.inspected_at)).sort().at(-1) ?? "";
  validateRecordOwnership([...wellMap.values()]);
  return {
    roots: [...new Set([...a.roots, ...b.roots])],
    wells: Array.from(wellMap.values()).sort((x, y) => String(x.metadata.asset_id).localeCompare(String(y.metadata.asset_id))),
    areas: mergeById(a.areas, b.areas, "area_id"),
    users: mergeById(a.users, b.users, "user_id"),
    documents,
    manuals,
    warnings:[...(a.warnings??[]),...(b.warnings??[])],
    today: latest ? new Date(Date.parse(latest) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : ""
  };
}
export async function loadDataset(roots: string[], referenceDate?: string): Promise<Dataset> {
  if (!roots.length) throw new Error("No dataset folder was provided.");
  let combined = await readOneRoot(roots[0]);
  for (const root of roots.slice(1)) combined = mergeDatasets(combined, await readOneRoot(root));
  if (!combined.today) {
    const latest = combined.wells.flatMap((w) => w.inspections.map((i) => i.inspected_at)).sort().at(-1);
    combined.today = latest ? new Date(Date.parse(latest) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  }
  if (referenceDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(referenceDate) || !Number.isFinite(Date.parse(referenceDate)) || new Date(referenceDate).toISOString().slice(0,10)!==referenceDate) throw new Error('Reference date must be a real date in YYYY-MM-DD format.');
    combined.today=referenceDate;
  }
  return combined;
}
export async function validateDatasetPath(input: string) {
  return normalizeRoot(input);
}
