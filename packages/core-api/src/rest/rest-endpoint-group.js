import figlet from 'figlet';
export class RestEndpointGroup {
    sectorName;
    sectorSplashCache;
    apiBaseUrl;
    constructor(sectorName, apiBaseUrl = '/saga-soa') {
        this.sectorName = sectorName;
        this.apiBaseUrl = apiBaseUrl;
    }
    get sectorSplash() {
        if (!this.sectorSplashCache) {
            this.sectorSplashCache = figlet.textSync(this.sectorName, { font: 'Alligator' });
        }
        return `<pre>${this.sectorSplashCache}</pre>`;
    }
    sectorHomeRoute() {
        return (req, res) => {
            res.send(this.sectorSplash);
        };
    }
    aliveRoute() {
        return (req, res) => {
            res.json({ status: 'alive', sector: this.sectorName });
        };
    }
    /**
     * Register all routes for this sector with the given router.
     * Should be called by RestRouter.
     */
    registerRoutes(router) {
        const sectorBase = `${this.apiBaseUrl}/${this.sectorName}`;
        router.get(`${sectorBase}/alive`, this.aliveRoute());
        router.get(sectorBase, this.sectorHomeRoute());
        this.registerSectorRoutes(router, sectorBase);
    }
}
