export interface CountryData {
  code: string;
  name: string;
  cities: string[];
}

export const countriesData: CountryData[] = [
  {
    code: "US",
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Indianapolis", "Columbus", "Fort Worth", "Charlotte", "Seattle", "Denver", "El Paso", "Boston", "Detroit", "Nashville", "Memphis", "Portland", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Long Beach", "Colorado Springs", "Raleigh", "Miami", "Virginia Beach", "Omaha", "Oakland", "Minneapolis", "Tulsa", "Arlington", "New Orleans", "Wichita", "Cleveland"]
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: ["London", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Manchester", "Bristol", "Bristol", "Kirklees", "Fife", "Wirral", "North Lanarkshire", "Wakefield", "Cardiff", "Dudley", "Wigan", "East Riding", "Coventry", "Belfast", "Leicester", "Sunderland", "Sandwell", "Doncaster", "Stockport", "Sefton", "Nottingham", "Newcastle-upon-Tyne", "Kingston-upon-Hull", "Bolton", "Aberdeen", "South Gloucestershire", "St Helens", "Newport", "Solihull", "Plymouth", "Luton", "Derby", "Richmond", "Stoke-on-Trent", "Southampton", "Clinton", "Portsmouth", "Wolverhampton", "Gateshead", "Calderdale", "South Tyneside"]
  },
  {
    code: "IN",
    name: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad"]
  },
  {
    code: "CA",
    name: "Canada",
    cities: ["Toronto", "Montreal", "Calgary", "Ottawa", "Edmonton", "Mississauga", "North York", "Winnipeg", "Scarborough", "Vancouver", "Quebec City", "Hamilton", "Brampton", "Surrey", "Laval", "Halifax", "Etobicoke", "London", "Oshawa", "Victoria", "Windsor", "Markham", "Gatineau", "Vaughan", "Kitchener", "Longueuil", "Burnaby", "Ladner", "Saskatoon", "Richmond", "Barrie", "Richmond Hill", "Nepean", "Regina", "Oakville", "Burlington", "Greater Sudbury", "Abbotsford", "Saguenay", "St. Catharines", "Sherbrooke", "Anjou", "Levis", "Kelowna", "Trois-Rivieres", "St. John's", "Cambridge"]
  },
  {
    code: "AU",
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City", "Geelong", "Hobart", "Townsville", "Cairns", "Toowoomba", "Darwin", "Launceston", "Alice Springs", "Ballarat", "Bendigo", "Mandurah", "Mackay", "Melton", "Rockhampton", "Bunbury", "Bundaberg", "Hervey Bay", "Wagga Wagga", "Coffs Harbour", "Albury", "Shepparton", "Port Macquarie", "Orange", "Queanbeyan", "Dubbo", "Geraldton", "Bathurst", "Gladstone", "Kalgoorlie", "Warrnambool", "Lismore"]
  },
  {
    code: "FR",
    name: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Etienne", "Toulon", "Grenoble", "Dijon", "Angers", "Villeurbanne", "Le Mans", "Nimes", "Aix-en-Provence", "Brest", "Clermont-Ferrand", "Limoges", "Tours", "Amiens", "Metz", "Perpignan", "Besancon", "Boulogne-Billancourt", "Orleans", "Rouen", "Mulhouse", "Caen", "Nancy", "Saint-Denis", "Saint-Paul", "Montreuil", "Nancy"]
  },
  {
    code: "JP",
    name: "Japan",
    cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama", "Hiroshima", "Sendai", "Kitakyushu", "Chiba", "Sakai", "Niigata", "Hamamatsu", "Shizuoka", "Sagamihara", "Okayama", "Kanazawa", "Utsunomiya", "Omiya", "Matsuyama", "Amagasaki", "Kurashiki", "Himeji", "Yokosuka", "Oita", "Fukuyama", "Nara", "Kawaguchi", "Asahikawa", "Nagano", "Toyama", "Toyota", "Kochi", "Miyazaki", "Hakodate", "Takabori"]
  },
  {
    code: "DE",
    name: "Germany",
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Munster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Gelsenkirchen", "Monchengladbach", "Braunschweig", "Chemnitz", "Kiel", "Aachen", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Lubeck", "Mainz", "Erfurt", "Rostock", "Kassel", "Hagen"]
  },
  {
    code: "BR",
    name: "Brazil",
    cities: ["Sao Paulo", "Rio de Janeiro", "Salvador", "Brasilia", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belem", "Goiania", "Guarulhos", "Campinas", "Sao Luis", "Sao Goncalo", "Maceio", "Duque de Caxias", "Natal", "Teresina", "Sao Bernardo do Campo", "Nova Iguacu", "Campo Grande", "Joao Pessoa", "Santo Andre", "Osasco", "Jaboatao dos Guararapes", "Sao Jose dos Campos", "Ribeirao Preto", "Uberlandia", "Contagem", "Sorocaba", "Aracaju", "Feira de Santana", "Cuiaba", "Joinville"]
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras al-Khaimah", "Fujairah", "Umm al-Quwain", "Khor Fakkan", "Dibba Al-Fujairah", "Kalba", "Zayed City"]
  },
  {
    code: "IT",
    name: "Italy",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste", "Taranto", "Brescia", "Prato", "Reggio Calabria", "Modena", "Parma", "Perugia", "Reggio Emilia", "Livorno", "Ravenna", "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Monza", "Siracusa", "Pescara", "Bergamo", "Trento", "Vicenza"]
  },
  {
    code: "ES",
    name: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Murcia", "Palma de Mallorca", "Las Palmas", "Bilbao", "Alicante", "Cordoba", "Valladolid", "Vigo", "Gijon", "L'Hospitalet de Llobregat", "A Coruna", "Vitoria-Gasteiz", "Granada", "Elche", "Oviedo", "Santa Cruz de Tenerife", "Badalona", "Cartagena", "Terrassa", "Jerez de la Frontera", "Sabadell", "Mostoles", "Alcala de Henares", "Pamplona", "Fuenlabrada", "Almeria"]
  },
  {
    code: "SG",
    name: "Singapore",
    cities: ["Singapore", "Changi", "Bedok", "Tampines", "Hougang", "Woodlands", "Jurong East", "Yishun", "Ang Mo Kio"]
  }
];
