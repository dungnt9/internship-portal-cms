const fileApi = {
  defaults: {
    baseURL: 'http://localhost:8003' // Direct to registration service
  }
}

// View file in browser
export const viewFile = (filePath) => {
  try {
    return `${fileApi.defaults.baseURL}/files/view?path=${encodeURIComponent(filePath)}`
  } catch (err) {
    console.error('Error creating file view URL:', err)
    throw err
  }
}

// Download file
export const downloadFile = (filePath) => {
  try {
    return `${fileApi.defaults.baseURL}/files/download?path=${encodeURIComponent(filePath)}`
  } catch (err) {
    console.error('Error creating file download URL:', err)
    throw err
  }
}
