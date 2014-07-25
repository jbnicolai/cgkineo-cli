module.exports = {
    DefaultProjectManifestPath : './adapt.json',
    DefaultCreateType : 'course',
    DefaultCourseName : 'my-adapt-course',
    FrameworkRepository : process.env.ADAPT_FRAMEWORK || 'https://github.com/cgkineo/adapt_framework',
    FrameworkRepositoryName : 'adapt_framework',
    DefaultBranch : process.env.ADAPT_BRANCH || 'feature-cgkineo-cli',
    Registry: process.env.ADAPT_REGISTRY || 'registry.json',
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
