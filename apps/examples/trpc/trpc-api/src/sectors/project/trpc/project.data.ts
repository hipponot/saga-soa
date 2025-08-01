import { v4 as uuidv4 } from 'uuid';
import type { Project, CreateProjectInput, UpdateProjectInput } from './project.types.js';

// Mock data store
const projects: Project[] = [
  {
    id: '1',
    name: 'Saga SOA Platform',
    description: 'A modular service-oriented architecture platform',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'API Gateway',
    description: 'Centralized API management and routing',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Business logic functions
export const getAllProjects = (): Project[] => {
  return [...projects];
};

export const getProjectById = (id: string): Project | null => {
  return projects.find(project => project.id === id) || null;
};

export const createProject = (input: CreateProjectInput): Project => {
  const now = new Date();
  const project: Project = {
    id: uuidv4(),
    name: input.name,
    description: input.description,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  projects.push(project);
  return project;
};

export const updateProject = (input: UpdateProjectInput): Project | null => {
  const projectIndex = projects.findIndex(project => project.id === input.id);
  if (projectIndex === -1) {
    return null;
  }

  const project = projects[projectIndex]!;
  const updatedProject: Project = {
    id: project.id,
    name: input.name ?? project.name,
    description: input.description ?? project.description,
    status: input.status ?? project.status,
    createdAt: project.createdAt,
    updatedAt: new Date(),
  };

  projects[projectIndex] = updatedProject;
  return updatedProject;
};

export const deleteProject = (id: string): boolean => {
  const projectIndex = projects.findIndex(project => project.id === id);
  if (projectIndex === -1) {
    return false;
  }

  projects.splice(projectIndex, 1);
  return true;
};
