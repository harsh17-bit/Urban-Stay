import api from './api';

/**
 * ML Service for price prediction
 */
class MLService {
  /**
   * Predict property price based on features
   * @param {Object} propertyData - Property features
   * @param {string} propertyData.city - City/location name
   * @param {number} propertyData.area - Area in square feet
   * @param {number} propertyData.bedrooms - Number of bedrooms
   * @param {number} propertyData.bathrooms - Number of bathrooms
   * @param {number} propertyData.amenitiesCount - Count of amenities
   * @returns {Promise<Object>} Prediction result
   */
  async predictPrice(propertyData) {
    try {
      const response = await api.post(
        '/ml/predict',
        {
          city: (propertyData.city || '').toLowerCase(),
          area: Number(propertyData.area) || 1000,
          bedrooms: Number(propertyData.bedrooms) || 2,
          bathrooms: Number(propertyData.bathrooms) || 1,
          amenitiesCount: Number(propertyData.amenitiesCount) || 0,
          listedPrice:
            propertyData.listedPrice !== undefined
              ? Number(propertyData.listedPrice)
              : undefined,
        },
        {
          timeout: 10000, // 10 second timeout
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('ML prediction error:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to get price prediction',
      };
    }
  }

  /**
   * Get health status of ML service
   * @returns {Promise<Object>} Health check result
   */
  async healthCheck() {
    try {
      const response = await api.get('/ml/health', {
        timeout: 5000,
      });
      return {
        success: true,
        data: response.data,
      };
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return {
        success: false,
        error: 'ML service is unavailable',
      };
    }
  }

  /**
   * Get list of supported cities
   * @returns {Promise<Array<string>>} List of supported cities
   */
  async getSupportedCities() {
    try {
      const response = await api.get('/ml/locations', {
        timeout: 5000,
      });
      return response.data.cities || [];
    } catch (error) {
      console.error('Failed to fetch supported cities:', error);
      return [];
    }
  }
}

export default new MLService();
