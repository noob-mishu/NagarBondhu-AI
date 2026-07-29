const api = {
  createReport(reportData) {
    return Promise.resolve({
      ...reportData,
      _id: `report-${Date.now()}`,
      priority: 'Medium',
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    });
  },
};

export default api;
