const Profile = require('../models/Profile');

// 📌 GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      // Si aucun profil n'existe encore, on en crée un par défaut
      profile = await Profile.create({
        user: req.user.id,
        title: req.user.name,
        contactPhone: req.user.phone,
      });
    }

    res.json(profile);
  } catch (err) {
    console.error('Erreur profil :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📌 PUT /api/profile/photo
exports.updateProfilePhoto = async (req, res) => {
  try {
    const filePath = `/uploads/profiles/${req.file.filename}`;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { photoUrl: filePath },
      { new: true, upsert: true }
    );

    res.json({ message: 'Photo mise à jour', profile });
  } catch (err) {
    console.error('Erreur upload photo :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



exports.updateProfileDetails = async (req, res) => {
    try {
      const { title, description, contactPhone, address } = req.body;
  
      const updated = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { title, description, contactPhone, address },
        { new: true, upsert: true }
      );
  
      res.json({ message: 'Profil mis à jour', profile: updated });
    } catch (err) {
      console.error('Erreur mise à jour profil :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
  