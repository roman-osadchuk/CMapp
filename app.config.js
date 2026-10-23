const pkg = require('./package.json');

const ENVIRONMENT = process.env.ENVIRONMENT;

module.exports = {
    name: 'CashMine',
    slug: 'cashmine',
    version: pkg.version,
    scheme: 'cashmine',
    // Solid-color native splash (no logo) so it matches the Lottie's empty first
    // frame and hands off seamlessly — the logo is drawn by the animation itself,
    // avoiding a visible "static logo splash -> animation restart" double splash.
    splash: {
        backgroundColor: '#7C3AED',
        resizeMode: 'cover',
    },
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    jsEngine: 'hermes',
    newArchEnabled: true,
    assetBundlePatterns: ['./assets/*'],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.cashmine.CashMineTestApp',
    },
    runtimeVersion: { policy: 'appVersion' },
    experiments: {
        typedRoutes: true,
    },
    plugins: [
        [
            "expo-router",
            {
                "origin": "http://localhost:8081"
            }
        ]
    ],
    extra: {
        ENVIRONMENT: process.env.ENVIRONMENT,
        BASE_URL: process.env.BASE_URL,

        router: {
            origin: false,
        },
        eas: {
            projectId: '8562e5d0-32b7-4196-ab78-12c8151baa96',
        },
    },
    owner: 'romanosadchuk94',
};
