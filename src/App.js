import React, { Component } from 'react'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoaded: false,
      albums: [],
      allPhotos: [],
      error: '',
      ascending: true,
      sortedByKey: '',
      searchText: '',
      numPhotosShowing: 0,
      albumsFiltered: new Set()
    }
    this.search = null
  }

  componentDidMount() {
    //get albums
    fetch('https://jsonplaceholder.typicode.com/albums')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            albums: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
    //get photos
    fetch('https://jsonplaceholder.typicode.com/photos')
      .then(res => res.json())
      .then(
        (result) => {
          result.forEach(res => {
            res.albumTitle = this.state.albums[res.albumId - 1].title
          })
          this.setState({
            isLoaded: true,
            allPhotos: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  getAlbumTitle(albumId) {
    const { albums } = this.state
    for (let i = 0; i < albums.length; i++) {
      if (albums[i].id === albumId) {
        return albums[i].title
      }
    }
  }
  
  compare(key, a, b) {
    if (a[key] > b[key]) //sort string ascending
      return -1
    if (a[key] < b[key])
      return 1
    return 0
  }
  compareHelper(key, order = 'ascending') {
    if (key === 'albumId') { // comparing ints
      if (order === 'ascending') {
        return (a, b) => {
          return this.compare(key, a, b)
        }
      }
      return (a, b) => {
        return this.compare(key, b, a)
      }
    } else { // comparing strings 
      if (order === 'ascending') {
        return (a, b) => {
          return this.compare(key, b, a)
        }
      }
      return (a, b) => {
        return this.compare(key, a, b)
      }
    }
  }
  sortByKey(key, order) {
    return this.state.allPhotos.sort(this.compareHelper(key, order))
  }
  sort(key) {
    const { ascending } = this.state
    if (key === 'photo') return
    const sortedObjects = this.sortByKey(key, ascending ? 'ascending' : 'descednding')
    this.setState({ ...this.state, ascending: !ascending, allPhotos: sortedObjects, sortedByKey: key })
  }

  shouldShowSortDirection(key) {
    const { sortedByKey, ascending } = this.state
    if (sortedByKey === key) {
      return ascending ? "[ASC]" : "[DESC]"
    }
  }

  handleInputChange = () => {
    if (this.search.value === '') {
      this.setState({ ...this.state, searchText: '' })
    }
    this.setState({ ...this.state, searchText: this.search.value })
  }

  addPhotos(num) {
    const { numPhotosShowing } = this.state
    this.setState({ ...this.state, numPhotosShowing: numPhotosShowing + num })
  }

  setFilterArr(title) {
    const { albumsFiltered } = this.state

    if(albumsFiltered.has(title)){
      albumsFiltered.delete(title)
    } else {
      albumsFiltered.add(title)
    }
    this.setState({ ...this.state, albumsFiltered })
    return

  }

  renderFilterData() {
    const { albums, albumsFiltered } = this.state
    return albums.map((album, index) => {
      const { title, id } = album
      return (
        <tr key={id}>
          <td>
            <button className='filterButtons' onClick={() => this.setFilterArr(title)}>{albumsFiltered.has(title) ? 'X' : ' '}</button>
            {title}
          </td>
        </tr>
      )
    })
  }

  renderFilters() {
    return (
      <div className="filterDropdown">
        <table>
            <tr>
              <button className='clearFiltersButton' onClick={() => this.setState({ ...this.state, albumsFiltered: new Set() })}>({this.state.albumsFiltered.size})Remove Filters</button>
              <th>Filter By Album Title</th>
            </tr>
            {this.renderFilterData()}
        </table>
      </div>
    )
  }

  renderTableHeader() {
    const keys = ['albumId', 'albumTitle', 'title', 'photo']
    return keys.map((key, index) => {
      return <th className='photosCell' onClick={() => this.sort(key)} key={index}>{key.toUpperCase()} {this.shouldShowSortDirection(key)} </th>
    })
  }

  renderTableData() {
    const { allPhotos, numPhotosShowing, albumsFiltered, searchText } = this.state
    const filteredPhotos = allPhotos.filter(photo => albumsFiltered.has(photo.albumTitle) || albumsFiltered.size === 0)
                                    .filter(photo => photo.title.includes(searchText) || photo.albumTitle.includes(searchText))
    const photosToShow = filteredPhotos.slice(0, numPhotosShowing)
    return photosToShow.map((photo, index) => {
      const { albumId, id, title, thumbnailUrl, albumTitle } = photo //destructuring
      return (
        <tr key={id}>
          <td className='photosCell'>{albumId}</td>
          <td className='photosCell'>{albumTitle}</td>
          <td className='photosCell'>{title}</td>
          <td className='photosCell'><img src={thumbnailUrl}></img></td>
        </tr>
      )
    })
  }

  render() {
    const { numPhotosShowing } = this.state
    return (
      <div className='container'>
        <h1 className='title'>Photos Table (showing {numPhotosShowing})</h1>
        <input placeholder='Search by album or photo title' className='search' ref={input => this.search = input} onChange={this.handleInputChange}></input>
        {this.renderFilters()}
        <div className='buttons'>
          <button disabled={this.state.numPhotosShowing >= 5000 } onClick={() => this.addPhotos(25)}>Add 25</button>
          <button disabled={this.state.numPhotosShowing <= 0 } onClick={() => this.addPhotos(-25)}>Remove 25</button>
        </div>
        <table className='photos'>
          <tr className='photosHeader'>{this.renderTableHeader()}</tr>
          {this.renderTableData()}
        </table>
      </div>
    );
  }
}

export default App;
