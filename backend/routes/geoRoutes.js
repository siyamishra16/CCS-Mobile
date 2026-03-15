const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

const COUNTRY = "India";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cache = {
  states: { data: null, expires: 0 },
  cities: new Map(),
};

const isFresh = (entry) => entry && entry.expires > Date.now();

router.get("/states", async (req, res) => {
  try {
    if (isFresh(cache.states)) {
      return res.json({ source: "cache", states: cache.states.data });
    }

    const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: COUNTRY }),
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Failed to fetch states" });
    }

    const payload = await response.json();
    if (payload?.error || !payload?.data?.states) {
      return res.status(502).json({ message: "Invalid states response" });
    }

    const states = payload.data.states
      .map((state) => state.name)
      .filter(Boolean);

    cache.states = { data: states, expires: Date.now() + ONE_DAY_MS };

    return res.json({ source: "api", states });
  } catch (error) {
      console.error("Error fetching states:", error);
    return res.status(500).json({ message: "Server error fetching states", error: error.message });
  }
});

router.get("/cities", async (req, res) => {
  try {
    const state = String(req.query.state || "").trim();
    const limitRaw = String(req.query.limit || "").trim();
    const limit = limitRaw ? Number(limitRaw) : 200;
    if (!state) {
      return res.status(400).json({ message: "state is required" });
    }

    const cached = cache.cities.get(state);
    if (isFresh(cached)) {
      const limited = Number.isFinite(limit) && limit > 0 ? cached.data.slice(0, limit) : cached.data;
      return res.json({ source: "cache", state, cities: limited });
    }

    const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: COUNTRY, state }),
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Failed to fetch cities" });
    }

    const payload = await response.json();
    if (payload?.error || !Array.isArray(payload?.data)) {
      return res.status(502).json({ message: "Invalid cities response" });
    }

    const cities = payload.data.filter(Boolean);
    cache.cities.set(state, { data: cities, expires: Date.now() + ONE_DAY_MS });

    const limited = Number.isFinite(limit) && limit > 0 ? cities.slice(0, limit) : cities;
    return res.json({ source: "api", state, cities: limited });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return res.status(500).json({ message: "Server error fetching cities", error: error.message });
  }
});

module.exports = router;
