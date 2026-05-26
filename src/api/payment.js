import API from './index';

const paymentService = {
  initializePayment: (data) => API.post('payments/initialize/', data),
  verifyPayment: (data) => API.post('payments/verify/', data),
};

export default paymentService;
