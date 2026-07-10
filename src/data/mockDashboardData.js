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
    { title: 'Current Sensor', value: null, unit: 'mA', status: 'Waiting', variant: 'muted' },
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
      unit: 'mA',
      color: '#d97706',
      points: [],
    },
  },
  prediction: {
    title: 'PredictionCard',
    prediction: 'Normal Operation',
    probability: 91,
    description: 'Mock prediction output for component structure only.',
    variant: 'success',
  },
  fault: {
    title: 'FaultCard',
    fault: 'No critical fault detected',
    severity: 'Low',
    description: 'Mock diagnostic state for the current motor sample.',
    variant: 'success',
  },
  recommendations: [
    {
      title: 'Inspect vibration mounting',
      content: 'Validate that the sensor mount is secure before long runtime testing.',
    },
    {
      title: 'Schedule bearing review',
      content: 'Plan a non-urgent mechanical inspection during the next maintenance window.',
    },
    {
      title: 'Monitor temperature drift',
      content: 'Track temperature trend once real sensor data is connected.',
    },
  ],
  recommendationPanel: {
    title: 'RecommendationAccordion',
    description: 'Mock maintenance guidance items.',
    defaultValue: 'item-0',
  },
}
