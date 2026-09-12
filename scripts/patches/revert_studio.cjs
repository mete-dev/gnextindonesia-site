const fs = require('fs');
let code = fs.readFileSync('src/pages/Studio.tsx', 'utf-8');

// Remove DemographicsManager import
code = code.replace("import DemographicsManager from './studio/DemographicsManager';\n", "");

// Remove 'demographics' from activeTab state type
code = code.replace("useState<'analytics' | 'demographics' | 'news' | 'categories' | 'settings' | 'users' | 'audit' | 'works' | 'partners'>('analytics');", "useState<'analytics' | 'news' | 'categories' | 'settings' | 'users' | 'audit' | 'works' | 'partners'>('analytics');");

// Revert selectTab param type
code = code.replace("selectTab = (tab: 'analytics' | 'demographics' | 'news' | 'categories' | 'settings' | 'users' | 'audit' | 'works' | 'partners')", "selectTab = (tab: 'analytics' | 'news' | 'categories' | 'settings' | 'users' | 'audit' | 'works' | 'partners')");

// Remove Demographics tab button
code = code.replace(/<button\s+onClick=\{\(\) => selectTab\('demographics'\)\}[\s\S]*?<\/button>/, "");

// Remove conditional render
code = code.replace("{activeTab === 'demographics' && <DemographicsManager currentUser={currentUser} />}\n", "");

fs.writeFileSync('src/pages/Studio.tsx', code);
console.log('Done Studio revert');
