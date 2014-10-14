module.exports = {
    DefaultProjectManifestPath : './adapt.json',
    DefaultCreateType : 'course',
    DefaultCourseName : 'dev',
    FrameworkRepository : process.env.ADAPT_FRAMEWORK || 'https://github.com/cgkineo/adapt_framework',
    FrameworkRepositoryName : 'adapt_framework',
    GitRepository : process.env.GIT_REPO || 'https://github.com/cgkineo/',
    DefaultBranch : process.env.ADAPT_BRANCH || 'master',
    Registry: process.env.ADAPT_REGISTRY || 'registry.json',
    DefaultPluginBranch: 'master',
    HomeDirectory : searchForHome(),
};

function searchForHome() {
    var fs = require('fs'),
        locations = [
            process.env.HOME,
            (process.env.HOMEDRIVE + process.env.HOMEPATH),
            process.env.USERPROFILE,
            '/tmp',
            '/temp',
        ];
    var validLocations =  locations.filter(fs.existsSync);
    return validLocations[0];
}
