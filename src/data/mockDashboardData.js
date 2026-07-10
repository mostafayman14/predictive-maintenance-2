export const dashboardMockData = {
  brand: {
    name: 'Industrial AI',
    subtitle: 'Maintenance Suite',
  },
  navbar: {
    eyebrow: 'Graduation Project',
    title: 'Motor Predictive Maintenance',
  },
  connection: {
    label: 'Connected',
    variant: 'success',
    description: 'Local mock connection',
  },
  layoutLabels: {
    collapseSidebar: 'Collapse',
    expandSidebar: 'Expand sidebar',
    closeSidebar: 'Close sidebar',
    openSidebar: 'Open sidebar',
    currentTime: 'Current Time',
  },
  apiLabels: {
    loading: 'Loading backend data...',
    errorTitle: 'Backend data could not be loaded',
    retry: 'Retry',
  },
  liveLabels: {
    lastUpdate: 'Last Update',
    waiting: 'Waiting for live stream...',
  },
  offlineLabels: {
    title: 'Network offline',
    description: 'Connection lost. Displaying the latest available dashboard data.',
  },
  navigation: [
    { label: 'Dashboard', active: true },
    { label: 'Live Monitoring', active: false },
    { label: 'History', active: false },
  ],
  hero: {
    eyebrow: 'Graduation Project',
    title: 'Industrial motor monitoring interface for predictive maintenance workflows.',
    description:
      'Mock dashboard structure with reusable components prepared for future API integration.',
  },
  sections: {
    charts: {
      title: 'Live Charts Section',
      description: 'Mock chart components for future sensor streams.',
    },
    prediction: {
      title: 'Motor Prediction Section',
      description: 'Prediction, fault, and recommendation components.',
    },
  },
  sensors: [
    { title: 'Temperature Sensor', value: null, unit: '°C', status: 'Waiting', variant: 'muted' },
    { title: 'Vibration Sensor', value: null, unit: 'mm/s', status: 'Waiting', variant: 'muted' },
    { title: 'Sound Sensor', value: null, unit: 'dB', status: 'Waiting', variant: 'muted' },
    { title: 'Current Sensor', value: null, unit: 'A', status: 'Waiting', variant: 'muted' },
  ],
  charts: {
    temperature: {
      title: 'Temperature',
      unit: '°C',
      color: '#0891b2',
      points: [],
    },
    vibration: {
      title: 'Vibration',
      unit: 'mm/s',
      color: '#7c3aed',
      points: [],
    },
    sound: {
      title: 'Sound',
      unit: 'dB',
      color: '#059669',
      points: [],
    },
    current: {
      title: 'Current',
      unit: 'A',
      color: '#d97706',
      points: [],
    },
  },
  prediction: {
    title: 'Detected Condition',
    prediction: 'Healthy',
    probability: 100,
    description: 'Motor is operating normally. No maintenance is required.',
    variant: 'success',
  },
  fault: {
    title: 'Diagnosis',
    fault: 'Healthy',
    severity: 'Low',
    description: 'Motor is operating normally. No maintenance is required.',
    variant: 'success',
  },
  detectedCondition: 'Good100',
  recommendations: [
    {
      title: 'Recommended Action',
      content: 'Motor is operating normally. No maintenance is required.',
      value: 'item-0',
    },
    {
      title: 'Diagnosis',
      content: 'Healthy',
      value: 'item-1',
    },
    {
      title: 'Condition Code',
      content: 'Good100',
      value: 'item-2',
    },
  ],
  recommendationPanel: {
    title: 'Recommended Action',
    description: 'Guidance derived from the detected motor condition.',
    defaultValue: 'item-0',
  },
}
