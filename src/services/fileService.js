const fileApi = {
  defaults: {
    baseURL: 'http://localhost:8003' // Direct to registration service
  }
}

const evaluationFileApi = {
  defaults: {
    baseURL: 'http://localhost:8004' // Evaluation service
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

export const viewEvaluationFile = (filePath) => {
  try {
    return `${evaluationFileApi.defaults.baseURL}/files/view?path=${encodeURIComponent(filePath)}`
  } catch (err) {
    console.error('Error creating evaluation file view URL:', err)
    throw err
  }
}

export const downloadEvaluationFile = (filePath) => {
  try {
    return `${evaluationFileApi.defaults.baseURL}/files/download?path=${encodeURIComponent(filePath)}`
  } catch (err) {
    console.error('Error creating evaluation file download URL:', err)
    throw err
  }
}
