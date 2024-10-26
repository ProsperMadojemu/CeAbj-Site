<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html" encoding="UTF-8" />

    <xsl:template match="/">
        <html>
        <head>
            <title>RTMP Server Statistics</title>
            <style>
                body { font-family: Arial, sans-serif; }
                h2 { color: #04125c; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            </style>
        </head>
        <body>
            <h2>RTMP Server Statistics</h2>
            <table>
                <tr><th>Version</th><td><xsl:value-of select="/rtmp/nginx_version"/></td></tr>
                <tr><th>Uptime (seconds)</th><td><xsl:value-of select="/rtmp/uptime"/></td></tr>
                <tr><th>Incoming Bandwidth</th><td><xsl:value-of select="/rtmp/bw_in"/> bps</td></tr>
                <tr><th>Outgoing Bandwidth</th><td><xsl:value-of select="/rtmp/bw_out"/> bps</td></tr>
            </table>
            <h2>Applications</h2>
            <xsl:for-each select="/rtmp/server/application">
                <h3>Application: <xsl:value-of select="name"/></h3>
                <p>Number of Clients: <xsl:value-of select="live/nclients"/></p>
                <table>
                    <tr><th>Stream</th><th>Bandwidth In</th><th>Bandwidth Out</th></tr>
                    <xsl:for-each select="live/stream">
                        <tr>
                            <td><xsl:value-of select="name"/></td>
                            <td><xsl:value-of select="bw_in"/> bps</td>
                            <td><xsl:value-of select="bw_out"/> bps</td>
                        </tr>
                    </xsl:for-each>
                </table>
            </xsl:for-each>
        </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
