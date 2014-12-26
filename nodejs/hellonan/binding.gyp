{
  "targets": [
    {
      "target_name": "hellonan",
      "sources": [
        "main.cc",
	"piest.cc",
	"sync.cc",
	"async.cc"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]

}

