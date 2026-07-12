export const dashboardUiConfig = {
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
    description: 'Receiving motor data',
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
      'Live motor monitoring dashboard connected to backend sensor and prediction APIs.',
  },
  sections: {
    charts: {
      title: 'Live Charts Section',
      description: 'Rolling 3-hour sensor history from the backend API.',
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
  prediction: null,
  fault: null,
  detectedCondition: null,
  recommendations: [],
  recommendationPanel: {
    title: 'Recommended Action',
    description: 'Guidance derived from the detected motor condition.',
    defaultValue: 'item-0',
  },
}
