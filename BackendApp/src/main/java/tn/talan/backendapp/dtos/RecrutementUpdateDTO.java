package tn.talan.backendapp.dtos;

public class RecrutementUpdateDTO {
    private Long id;
    private String position; // Renommé 'position' pour correspondre au front

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}
