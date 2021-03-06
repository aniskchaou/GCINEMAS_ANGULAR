import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CinemaService } from 'src/app/services/cinema-service.service';
import { Router } from "@angular/router"
@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {

  public villes;
  public cinemas;
  public salles;
  public villeActuelle;
  public currentProjection;
  public currentCinema;
  public selectedTickets;


  constructor(public cinemaService: CinemaService, private router: Router) {

  }

  ngOnInit() {
    this.cinemaService.getVilles().subscribe(data => {
      this.villes = data;
    }, err => {
      console.error(err)
    });
  }

  //cinemas
  public getCinemaByVille(ville) {
    this.villeActuelle = ville;
    this.salles = undefined;
    this.cinemaService.getCinemaByVille(ville).subscribe(data => {
      this.cinemas = data;
    }, err => {
      console.error(err)
    });
  }


  //salles
  public getSalleByCinema(cinema) {
    this.currentCinema = cinema;
    this.cinemaService.getSalleByCinema(cinema).subscribe(data => {
      this.salles = data;
      this.salles._embedded.salles.forEach(salle => {
        this.cinemaService.getProjectionBySalle(salle).subscribe(data2 => {
          salle.projections = data2;
          console.log(data2);
        }, err => {
          console.error(err)
        });
      });
    }, err => {
      console.error(err)
    });
  }


  //payer ticket
  payTickets(formData) {
    let tickets = [];
    this.selectedTickets.forEach(t => {
      tickets.push(t.id);
    });
    formData.tickets = tickets;
    console.log(formData);
    this.selectedTickets.forEach(t => {
      this.cinemaService.payerTickets(formData).subscribe(data => {

        this.getPlaceTicketsByProjection(this.currentProjection);
      }, err => {
        console.error(err)
      });
    });
    
    alert("Votre réservation a été confirmé !");
    this.cinemaService.getSalleByCinema(this.currentCinema);
    

  }

  //classe css ticket
  getTicketClass(ticket) {
    let str = "";
    if (ticket.reserve == true) {
      str += "ticket_reserve";
    } else if (ticket.selected) {
      str += "ticket_selected";
    } else {
      str += "ticket";
    }
    return str;
  }

  //classe css ticket
  selectTicket(ticket) {
    if (!ticket.selected) {
      ticket.selected = true;
      this.selectedTickets.push(ticket);
    } else {
      ticket.selected = false;
      this.selectedTickets.slice(this.selectedTickets.indexOf(ticket), 1);
    }
  }

  //places
  getPlaceTicketsByProjection(projection) {
    this.currentProjection = projection;

    this.cinemaService.getPlaceTicketsByProjection(projection).subscribe(data => {
      this.currentProjection.tickets = data;
      this.selectedTickets = [];
    }, err => {
      console.error(err)
    });
  }
}
