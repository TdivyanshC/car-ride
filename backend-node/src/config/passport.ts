import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

// Note: This passport config is not actively used since we use token-based auth
// The auth flow uses google-auth-library directly in routes/auth.ts
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_GOOGLE_CLIENT_SECRET',
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user as any);
    }
    // Create new user - use name instead of displayName
    user = new User({
      googleId: profile.id,
      name: profile.displayName || '',
      email: profile.emails?.[0]?.value || '',
      photo: profile.photos?.[0]?.value,
      provider: 'google',
    });
    await user.save();
    done(null, user as any);
  } catch (error) {
    done(error, undefined);
  }
}));

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as any)._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as any);
  } catch (error) {
    done(error, null);
  }
});

export default passport;