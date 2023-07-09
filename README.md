# Dictionary backend

## Database

#### Start

```shell
docker compose up -d
```

#### Stop

```shell
docker compose down
```

#### Credentials

In `.env` file.

## Application

#### Setup

```shell
npm install
```

#### Start

```shell
npm start
```

## Endpoints

### Swagger

http://localhost:3000/api-docs/

```
GET localhost:3000/v1/phrases?lang=en&qty=5


### Get with defaults
GET localhost:3000/v1/phrases



### Check translation SUCCESS
POST localhost:3000/v1/check
Content-Type: application/json; charset=utf-8

[
  {
    "en": {
      "id": "071d3d5b-e396-46c9-9887-c8b71d810b3a"
    },
    "ru": {
      "value": "привет"
    }
  },
  {
    "en": {
      "id": "6b252ba0-edb9-4418-921e-6e1cc12a8bf9"
    },
    "ru": {
      "value": "мост"
    }
  }
]


### Check translation FAILUE
POST localhost:3000/v1/check
Content-Type: application/json; charset=utf-8

[
  {
    "en": {
      "id": "071d3d5b-e396-46c9-9887-c8b71d810b3a"
    },
    "ru": {
      "value": "приветствую"
    }
  },
  {
    "en": {
      "id": "6b252ba0-edb9-4418-921e-6e1cc12a8bf9"
    },
    "ru": {
      "value": "хз"
    }
  }
]


############ Admin

### Get pairs

GET localhost:3000/v1/admin/phrases?srcLang=en&tgtLang=ru&pageSize=10&pageNum=0


### Add pair

POST localhost:3000/v1/admin/add-pairs
Content-Type: application/json; charset=utf-8

[
  {
    "en": {
      "value": "climb"
    },
    "ru": {
      "value": "карабкаться"
    }
  },
  {
    "en": {
      "value": "climb"
    },
    "ru": {
      "value": "взбираться"
    }
  }
]

### Preload data from preload_phrases.csv

POST localhost:3000/v1/admin/preload


```
