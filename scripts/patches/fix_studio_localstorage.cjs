const fs = require('fs');
let code = fs.readFileSync('src/pages/Studio.tsx', 'utf-8');
code = code.replace(
  "  useEffect(() => {\n    const userJson = localStorage.getItem('studio_user');\n    if (!userJson) {\n      navigate('/loginstudio');\n    } else {\n      setCurrentUser(JSON.parse(userJson));\n    }\n  }, [navigate]);",
  `  useEffect(() => {
    try {
      const userJson = localStorage.getItem('studio_user');
      if (!userJson) {
        navigate('/loginstudio');
      } else {
        setCurrentUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
      navigate('/loginstudio');
    }
  }, [navigate]);`
);
fs.writeFileSync('src/pages/Studio.tsx', code);
console.log('Fixed localStorage in Studio.tsx');
