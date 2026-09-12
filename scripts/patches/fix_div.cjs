const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

const target = `
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      ) : activeSubTab === 'website' ? (
`;

const replacement = `
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      ) : activeSubTab === 'website' ? (
`;

code = code.replace(target.trim(), replacement.trim());
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed missing div');
