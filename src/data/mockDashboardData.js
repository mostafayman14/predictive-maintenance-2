import { createSeedPoints } from '../lib/chartUtils'

const seedEnd = Date.now()

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
    sensors: {
      title: 'Sensor Cards',
      description: 'Mock sensor readings for layout development.',
    },
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
    { title: 'Temperature Sensor', value: '68', unit: '°C', status: 'Normal', variant: 'success' },
    { title: 'Vibration Sensor', value: '3.4', unit: 'mm/s', status: 'Watch', variant: 'warning' },
    { title: 'Sound Sensor', value: '72', unit: 'dB', status: 'Normal', variant: 'success' },
    { title: 'Current Sensor', value: '11.8', unit: 'A', status: 'Normal', variant: 'success' },
  ],
  charts: {
    temperature: {
      title: 'Temperature',
      unit: '°C',
      color: '#0891b2',
      points: createSeedPoints([54, 57, 61, 63, 66, 68, 67, 69], seedEnd),
    },
    vibration: {
      title: 'Vibration',
      unit: 'mm/s',
      color: '#7c3aed',
      points: createSeedPoints([2.1, 2.4, 3.2, 3.4, 3.1, 3.6, 3.3, 3.4], seedEnd),
    },
    sound: {
      title: 'Sound',
      unit: 'dB',
      color: '#059669',
      points: createSeedPoints([64, 67, 70, 72, 71, 73, 72, 72], seedEnd),
    },
    current: {
      title: 'Current',
      unit: 'A',
      color: '#d97706',
      points: createSeedPoints([9.8, 10.4, 11.1, 11.8, 11.2, 12.1, 11.7, 11.8], seedEnd),
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
