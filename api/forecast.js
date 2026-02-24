export default async function handler(req, res) {
    const { city } = req.query;
    const apiKey = process.env.API_KEY;

    if (!city) return res.status(400).json({ error: 'Brak miasta' });

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
        if (!response.ok) throw new Error("Could not fetch forecast data");
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}