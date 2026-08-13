const validateRegisterInput = (data) => {
  const errors = {};

  const username = data.username || data.email ? (data.username || data.email).trim() : '';
  const password = data.password ? data.password : '';
  const name = data.name ? data.name.trim() : '';

  if (!username) {
    errors.username = 'Username is required';
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

  const username = data.username || data.email ? (data.username || data.email).trim() : '';
  const password = data.password ? data.password : '';

  if (!username) {
    errors.username = 'Username is required';
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
