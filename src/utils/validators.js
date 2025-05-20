export const validEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const emoji = (str) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]/u; // Basic emoji range
  return emojiRegex.test(str);
};

export const validName = (name) => {
  const nameRegex = /^.{2,50}$/;
  return nameRegex.test(name);
};
