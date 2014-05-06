<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:template match="movies">
        <movies>
            <xsl:apply-templates select="movie"/>
        </movies>
    </xsl:template>
    
    <xsl:template match="movie">
        <movie>
            <xsl:apply-templates select="*"/>
        </movie>
    </xsl:template>
    
    <xsl:template match="genres">
        <genres>
            <xsl:for-each select="movie">
                <genre>
                    <xsl:value-of select="."/>
                </genre>
            </xsl:for-each>    
        </genres>
    </xsl:template>
    
    <xsl:template match="release_dates">
        <release_date>
            <xsl:value-of select="theater"/>
        </release_date>
    </xsl:template>
    
    <xsl:template match="posters">
        <poster>
            <xsl:value-of select="detailed"/>
        </poster>
    </xsl:template>
    
    <xsl:template match="abridged_cast">
        <cast>
            <xsl:for-each select="movie">
                <actor>
                    <xsl:copy-of select="name"/>
                    <xsl:copy-of select="id"/>
                    <characters>
                        <xsl:for-each select="characters/movie">
                            <character>
                                <xsl:value-of select="."/>
                            </character>
                        </xsl:for-each>
                    </characters>                    
                </actor>
            </xsl:for-each>    
        </cast>
    </xsl:template>
    
    <xsl:template match="abridged_directors">
        <directors>
            <xsl:for-each select="movie">
                <director>
                    <xsl:copy-of select="name"/>                      
                </director>
            </xsl:for-each>    
        </directors>
    </xsl:template>
    
    <xsl:template match="alternate_ids">
        <xsl:copy-of select="imdb"/>
    </xsl:template>
    
    <xsl:template match="similar">
        <similar_movies>
            <xsl:for-each select="movie">
                <similar_movie>
                    <xsl:copy-of select="node()"/>                      
                </similar_movie>
            </xsl:for-each>    
        </similar_movies>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:copy-of select="."/>
    </xsl:template>
</xsl:stylesheet>