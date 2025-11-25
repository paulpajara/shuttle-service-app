const allowed = (process.env.ALLOWED_UNI_DOMAINS || 'university.edu').split(',').map(s=>s.trim().toLowerCase());

function isUniversityEmail(email){
  if(!email) return false;
  const parts = email.split('@');
  if(parts.length !== 2) return false;
  return allowed.includes(parts[1].toLowerCase());
}

module.exports = { isUniversityEmail };
