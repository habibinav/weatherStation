import requests
import csv

# url = 'https://api.ambientweather.net/v1/devices?limit=288'
url='https://rt.ambientweather.net/v1/devices/C8:C9:A3:55:8B:82?limit=288'
api_key = '68a5362012e345c690ac0f68d1c75d5659174d9d635d48f3bc5c993e8ce55e21'
data = requests.get(url, params={'apiKey':api_key,'applicationKey' :'b57baf132eb7414096d2a958f64e146639f1541309f64c77b6e6e87a68588463'})
print(data.text)

with open("hello.csv","w") as a:
    a.write(data.text)

# with open("hello.csv","r") as a:
#     data = a.read()
#     l=eval(data)
#     print(len(l))