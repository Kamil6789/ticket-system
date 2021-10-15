module.exports = {
    productionSourceMap: false,
    devServer: {
        host: "localhost",
        hot: true,
        port: 8080,  
        publicPath: "/",
        disableHostCheck: true,
        proxy: {
            "/api/*":  {
                target: "http://localhost:3000",
                secure: false
            }
        }
    }
}