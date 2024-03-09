import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User.js";

export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        console.log("Google Profile:", profile);

        try {
          const user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const newUser = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              photo: profile.photos[0].value,
            });

            console.log("New User Created:", newUser);
            return done(null, newUser);
          } else {
            console.log("Existing User Found:", user);
            return done(null, user);
          }
        } catch (error) {
          console.error("Passport Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing User:", user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log("Deserializing User:", user);
      done(null, user);
    } catch (error) {
      console.error("Deserialize User Error:", error);
      done(error, null);
    }
  });
};
