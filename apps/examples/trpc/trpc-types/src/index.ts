// Re-export all generated types with proper naming
export type CreateProjectInput = import('./generated/CreateProject.js').CreateProject;
export type UpdateProjectInput = import('./generated/UpdateProject.js').UpdateProject;
export type GetProjectInput = import('./generated/GetProject.js').GetProject;

export type CreateRunInput = import('./generated/CreateRun.js').CreateRun;
export type UpdateRunInput = import('./generated/UpdateRun.js').UpdateRun;
export type GetRunInput = import('./generated/GetRun.js').GetRun;
export type GetRunsByProjectInput = import('./generated/GetRunsByProject.js').GetRunsByProject;

// Re-export the original types for backward compatibility
export * from './generated/CreateProject.js';
export * from './generated/UpdateProject.js';
export * from './generated/GetProject.js';
export * from './generated/CreateRun.js';
export * from './generated/UpdateRun.js';
export * from './generated/GetRun.js';
export * from './generated/GetRunsByProject.js'; 