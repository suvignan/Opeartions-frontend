export const PROJECT_TYPES = Object.freeze({
  WEB_APP: 'WEB_APP',
  MOBILE_APP: 'MOBILE_APP',
  ML_PROJECT: 'ML_PROJECT',
  DATA_PIPELINE: 'DATA_PIPELINE',
  OTHER: 'OTHER'
});

export const projectTypeOptions = [
  { value: PROJECT_TYPES.WEB_APP, label: 'Web Application' },
  { value: PROJECT_TYPES.MOBILE_APP, label: 'Mobile App' },
  { value: PROJECT_TYPES.ML_PROJECT, label: 'ML Project' },
  { value: PROJECT_TYPES.DATA_PIPELINE, label: 'Data Pipeline' },
  { value: PROJECT_TYPES.OTHER, label: 'Other' }
];

export const projectTypeLabelByValue = projectTypeOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export const isValidProjectType = (value) =>
  projectTypeOptions.some((option) => option.value === value);