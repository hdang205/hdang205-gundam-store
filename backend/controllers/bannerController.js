import Banner from "../models/Banner.js";

export const getBanners = async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort("order");
  res.json(banners);
};

export const getAllBanners = async (req, res) => {
  const banners = await Banner.find({}).sort("order");
  res.json(banners);
};

export const createBanner = async (req, res) => {
  const banner = new Banner(req.body);
  const created = await banner.save();
  res.status(201).json(created);
};

export const updateBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    Object.assign(banner, req.body);
    const updated = await banner.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: "Banner not found" });
  }
};

export const deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } else {
    res.status(404).json({ message: "Banner not found" });
  }
};
