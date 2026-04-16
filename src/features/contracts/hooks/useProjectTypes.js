import { projectTypeOptions } from '../utils/projectTypeOptions';

export const useProjectTypes = () => {
  // Keep API-like shape so callers don't change when source becomes remote.
  return {
    options: projectTypeOptions,
    loading: false,
    error: null,
    retry: () => {}
  };
};