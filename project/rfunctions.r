top_50_countries_plot = function (year) {
  blah = country_year_num_attacks[country_year_num_attacks$year == year, ]
  blah = blah[order(blah$num_attacks, decreasing = 1), ]
  top_50_countries = blah[1:51, ]
  png(paste('/home/chandrasekar/Desktop/vis1/', 'top_50_countries', year, '.png', sep =''), width = 1706, height = 806)
  barplot(top_50_countries$num_attacks, names.arg = top_50_countries$country, las = 2, main = paste('Top 50 countries in ', year), ylab = "Number of attacks", xlab = 'Country')
  dev.off()
}

top_50_organizations_plot = function (year) {
  if (length(which(globalterrorismdb_0616dist$iyear == year)) == 0) {
    return;
  } else {
    filtered_data = globalterrorismdb_0616dist[globalterrorismdb_0616dist$iyear == year, ]
    filtered_data = filtered_data[filtered_data$gname != 'Unknown', ]
    blah = count(filtered_data, vars = c("gname"), wt_var = "nkill")
  	blah = blah[order(blah$freq, decreasing = 1), ]
  	top_50_orgs = blah[1:51, ]
    png(paste('/home/chandrasekar/Desktop/vis1/terror_org_top_50/excluding_unknown_attacks_wt_nkills/', 'top_50_terror_orgs', year, '.png', sep =''), width = 1706, height = 1200)
    par(mar=c(20.1, 4.1, 4.1, 2.1))
  	barplot(top_50_orgs$freq, names.arg = top_50_orgs$gname, las = 2, main = paste('Top 50 terror organizations in ', year), ylab = "Number of people killed", xlab = 'Terrorist organization')
  	dev.off()
  }
}

#   - column 1 contains the longitude in degrees
#   - column 2 contains the latitude in degrees
coords2country = function(points)
{  
  countriesSP <- getMap(resolution='high')

  # convert our list of points to a SpatialPoints object
  pointsSP = SpatialPoints(points, proj4string=CRS(proj4string(countriesSP)))  
  indices = over(pointsSP, countriesSP)

  # return the ADMIN names of each country
  indices$ADMIN  
  #indices$ISO3 # returns the ISO3 code 
  #indices$continent   # returns the continent (6 continent model)
  #indices$REGION   # returns the continent (7 continent model)
}


filtered_data = globalterrorismdb_0616dist[globalterrorismdb_0616dist$gname != 'Unknown', ]
blah = count(filtered_data, vars = c("gname"))
blah = blah[order(blah$freq, decreasing = 1), ]
top_50_orgs = blah[1:51, ]
png(paste('/home/chandrasekar/Desktop/vis1/terror_org_top_50/excluding_unknown_attacks/', 'top_50_terror_orgs', '.png', sep =''), width = 1706, height = 1200)
par(mar=c(20.1, 4.1, 4.1, 2.1))
barplot(top_50_orgs$freq, names.arg = top_50_orgs$gname, las = 2, main = paste('Top 50 terror organizations from 1970-2015', year), ylab = "Number of attacks", xlab = 'Terrorist organization')
dev.off()