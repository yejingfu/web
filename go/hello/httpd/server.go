package main

import (
       //"fmt"
       "net/http"
       "html/template"
       "regexp"
)

var templates = template.Must(template.ParseFiles("temp_view.html", "temp_edit.html"))
var titleValidator = regexp.MustCompile("^[a-zA-Z0-9]+$")

func writeHTMLByTemplate(w http.ResponseWriter, temp string, p *Page) {
     //t, err := template.ParseFiles("temp_" + temp + ".html")
     //if err != nil {
     //	http.Error(w, err.Error(), http.StatusInternalServerError)
     //   return
     //}
     //err = t.Execute(w, p)
     err := templates.ExecuteTemplate(w, "temp_" + temp + ".html", p)
     if err != nil {
     	http.Error(w, err.Error(), http.StatusInternalServerError)
     }
}

func getTitle(req *http.Request) string {
     lenPath := 6
     return req.URL.Path[lenPath:]
}

func viewHandler(w http.ResponseWriter, req * http.Request, title string) {
     p, err := loadPage(title)
     if err != nil {
     	http.Redirect(w, req, "/edit/" + title, http.StatusFound)
	return
     }
     writeHTMLByTemplate(w, "view", p)
}

func editHandler(w http.ResponseWriter, req *http.Request, title string) {
     p, err := loadPage(title)
     if err != nil {
     	// create a new Page if cannot load the page
	p = &Page{Title: title, Body: []byte("TODO: create the page by inputing any strings.")}
     }
     writeHTMLByTemplate(w, "edit", p)
     return
}

func saveHandler(w http.ResponseWriter, req *http.Request, title string) {
     // read from form and save to file
     body := req.FormValue("body")
     p := &Page{Title: title, Body: []byte(body)}
     err := p.save()
     if err != nil {
     	http.Error(w, err.Error(), http.StatusInternalServerError)
     	return
     }
     http.Redirect(w, req, "/view/" + title, http.StatusFound)
}

func makeHandler(fn func(http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
     return func(w http.ResponseWriter, req *http.Request) {
     	    title := req.URL.Path[6:]
	    if !titleValidator.MatchString(title) {
	       http.NotFound(w, req)
	       return
	    }
	    fn(w, req, title)
     }
}

func main() {
     http.HandleFunc("/view/", makeHandler(viewHandler))
     http.HandleFunc("/edit/", makeHandler(editHandler))
     http.HandleFunc("/save/", makeHandler(saveHandler))
     
     http.ListenAndServe(":8080", nil)
}
