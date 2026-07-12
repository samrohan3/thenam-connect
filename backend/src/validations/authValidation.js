const validateRegisterInput = (data) => {
  const errors = {};

  const email = data.email ? data.email.trim() : '';
  const password = data.password ? data.password : '';
  const name = data.name ? data.name.trim() : '';

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (!name) {
    errors.name = 'Name is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateLoginInput = (data) => {
  const errors = {};

  const email = data.email ? data.email.trim() : '';
  const password = data.password ? data.password : '';

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
