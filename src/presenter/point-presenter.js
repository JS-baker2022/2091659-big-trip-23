import {render, replace, remove} from '../framework/render.js';
import WayPointView from '../view/way-point-view.js';
import EditFormView from '../view/edit-form-view.js';
import {Mode} from '../const.js';

export default class PointPresenter {
  #pointsModel;
  #pointListContainer = null;
  #pointComponent = null;
  #formEditComponent = null;
  #point = null;
  #destinations = [];
  #offers = [];
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;

  constructor({pointListContainer, destinationsData, offersData, onDataChange, onModeChange}) {
    this.#pointListContainer = pointListContainer.element;
    this.#destinations = destinationsData;
    this.#offers = offersData;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevFormEditComponent = this.#formEditComponent;

    this.#pointComponent = new WayPointView({
      point: this.#point,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
      destinationsData: this.#destinations,
      offersData: this.#offers,
    });
    this.#formEditComponent = new EditFormView({
      point: this.#point,
      onFormClick: this.#handleFormClick,
      onFormSubmit: this.#handleFormSubmit,
      destinationsData: this.#destinations,
      offersData: this.#offers,
    });

    if (prevPointComponent === null || prevFormEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#formEditComponent, prevFormEditComponent);
    }

    remove(prevPointComponent);
    remove(prevFormEditComponent);
  }

  #prepareOffersToShow(point) {
    const offers = this.#pointsModel.getOffersByType(point.type);
    const idx = new Set(point.offers);
    return offers.filter((offer)=>idx.has(offer.id));
  }

  #replacePointToForm() {
    replace(this.#formEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#formEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  #handleFormClick = () => {
    this.#replaceFormToPoint();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#point, isFavorite: !this.#point.isFavorite});
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(point);
    this.#replaceFormToPoint();
  };

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  destroy(){
    remove(this.#pointComponent);
    remove(this.#formEditComponent);
  }
}
