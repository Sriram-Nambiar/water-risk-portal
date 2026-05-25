import express from 'express';
import fs from 'fs'; 
import path from 'path';
import cors from 'cors'

const app = express();
app.use(cors({

    origin: 'https://water-risk-portal.vercel.app' 
}));
app.use(express.json());

app.post('/report/risk', (req, res) => {
    
    const { lake_name, latitude, longitude, ph, cod, bod, tds } = req.body;
    
    console.log(`\n--- New Report for ${lake_name || "Unknown Location"} ---`);

    const MIN_PH = 6.5;
    const MAX_PH = 8.5;
    const MAX_COD = 250; 
    const MAX_BOD = 3;   
    const MAX_TDS = 500; 
    
    const isContaminated = 
        ph < MIN_PH || ph > MAX_PH || cod > MAX_COD || bod > MAX_BOD || tds > MAX_TDS;

    if (isContaminated) {
        console.log("Status: HIGH RISK - Saving to database & alerting authorities.");
        
        
        const alertData = {
            timestamp: new Date().toISOString(),
            lake_name,
            coordinates: { lat: latitude, lng: longitude },
            parameters: { ph, cod, bod, tds },
            status: "High Risk"
        };

       
        const filePath = path.join(process.cwd(), 'high_risk_alerts.json');
        
      
        fs.readFile(filePath, 'utf8', (err, data) => {
            let alerts = [];
            if (!err && data) {
                alerts = JSON.parse(data); 
            }
            alerts.push(alertData); 
            
            fs.writeFile(filePath, JSON.stringify(alerts, null, 2), (writeErr) => {
                if (writeErr) console.error("Error saving alert:", writeErr);
            });
        });

        return res.json({ 
            risk_level: "High", 
            message: `Alert registered for ${lake_name}. Authorities have been notified.` 
        });
    } else {
        console.log(" Status: SAFE - Within normal limits.");
        return res.json({ 
            risk_level: "Low", 
            message: "Water parameters are within safe limits." 
        });
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Advanced Municipal Server running at http://localhost:${port}`);
});